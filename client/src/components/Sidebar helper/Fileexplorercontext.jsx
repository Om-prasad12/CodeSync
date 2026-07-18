import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useRef,
} from "react";
import { socket } from "../../socket";

const FileExplorerContext = createContext(null);

export const useFileExplorer = () => {
  const ctx = useContext(FileExplorerContext);
  if (!ctx) {
    throw new Error(
      "useFileExplorer must be used inside <FileExplorerProvider>",
    );
  }
  return ctx;
};

export const FileExplorerProvider = ({
  expanded,
  children,
  username,
  userId,
}) => {
  const [openMenuFor, setOpenMenuFor] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [selectedFileContent, setSelectedFileContent] = useState(null); // live editor buffer
  const [savedContent, setSavedContent] = useState(null); // last-saved (DB) baseline
  const [fileContentLoading, setFileContentLoading] = useState(false);
  const [fileViewers, setFileViewers] = useState([]);

  const [pendingAction, setPendingAction] = useState(null);

  const toggleMenu = (id) => {
    setOpenMenuFor((prev) => (prev === id ? null : id));
  };

  useEffect(() => {
    if (!openMenuFor) return;

    const handleClickOutside = (e) => {
      if (!e.target.closest("[data-menu-anchor]")) {
        setOpenMenuFor(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [openMenuFor]);

  const isDirty = !!selectedFile && selectedFileContent !== savedContent;

  const currentFileRoomRef = useRef(null);
  const fileId = selectedFile?._id || selectedFile?.id || null;

  // Debounce content changes so we don't flood the socket on every keystroke
  const contentChangeTimeoutRef = useRef(null);

  // True while WE are setting content programmatically (loading from DB, or
  // applying a remote update) — Monaco's onChange fires even for these
  // programmatic changes, and we must NOT broadcast in that case, or we'd
  // re-emit stale/duplicate content back into the room.
  const isExternalUpdateRef = useRef(false);

  // Holds live content received via "existing-file-viewers" if it arrives
  // WHILE the DB fetch in selectFile is still in flight. selectFile checks
  // this once its fetch resolves, and prefers it over the DB content —
  // otherwise the DB fetch finishing later would overwrite the correct
  // live content with stale data.
  const pendingRemoteContentRef = useRef(undefined);

  useEffect(() => {
    if (fileId) {
      socket.emit("join-file", { fileId, username });
      currentFileRoomRef.current = fileId;
    }

    setFileViewers([]);
    pendingRemoteContentRef.current = undefined; // reset for the new file

    const handleExistingViewers = ({ fileId: eventFileId, viewers, latestContent }) => {
      if (eventFileId !== fileId) return;
      setFileViewers(viewers);

      if (latestContent !== undefined && latestContent !== null) {
        if (fileContentLoading) {
          // DB fetch (in selectFile) hasn't resolved yet — stash it, selectFile
          // will pick this up once its fetch completes instead of using stale DB content.
          pendingRemoteContentRef.current = latestContent;
        } else {
          // DB fetch already finished — safe to apply immediately.
          isExternalUpdateRef.current = true;
          setSelectedFileContent(latestContent);
        }
      }
    };

    const handleUserJoinedFile = ({ userId: joinedUserId, username: joinedUsername }) => {
      setFileViewers((prev) => {
        if (prev.some((v) => v.userId === joinedUserId)) return prev;
        return [...prev, { userId: joinedUserId, username: joinedUsername }];
      });
    };

    const handleUserLeftFile = ({ userId: leftUserId }) => {
      setFileViewers((prev) => prev.filter((v) => v.userId !== leftUserId));
    };

    const handleContentChange = ({ fileId: eventFileId, content, userId: senderId }) => {
      if (eventFileId !== fileId) return;
      if (senderId === userId) return;

      isExternalUpdateRef.current = true;
      setSelectedFileContent(content);
      // Deliberately NOT calling markSaved here — this is someone else's
      // unsaved draft, not a confirmed save. isDirty should still reflect
      // MY OWN save state, not whether the file matches everyone's live edits.
    };

    socket.on("existing-file-viewers", handleExistingViewers);
    socket.on("user-joined-file", handleUserJoinedFile);
    socket.on("user-left-file", handleUserLeftFile);
    socket.on("file:content-change", handleContentChange);

    return () => {
      if (currentFileRoomRef.current) {
        socket.emit("leave-file", { fileId: currentFileRoomRef.current, username });
        currentFileRoomRef.current = null;
      }
      socket.off("existing-file-viewers", handleExistingViewers);
      socket.off("user-joined-file", handleUserJoinedFile);
      socket.off("user-left-file", handleUserLeftFile);
      socket.off("file:content-change", handleContentChange);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [fileId, username]);

  // Actually performs the switch — no dirty-check, callers decide when it's safe to call this.
  const selectFile = async (file, contentOrFetcher) => {
    const id = file._id || file.id;
    const alreadySelected = selectedFile && (selectedFile._id || selectedFile.id) === id;

    setSelectedFile(file);

    if (alreadySelected && selectedFileContent != null) {
      return;
    }

    if (typeof contentOrFetcher === "function") {
      setFileContentLoading(true);
      try {
        const dbContent = await contentOrFetcher();

        // If a live update arrived WHILE we were fetching, prefer it over
        // the (now potentially stale) DB content.
        const finalContent = pendingRemoteContentRef.current ?? (dbContent ?? "");
        pendingRemoteContentRef.current = undefined;

        isExternalUpdateRef.current = true;
        setSelectedFileContent(finalContent);

        // savedContent should always reflect the actual DB value, NOT the
        // live content — so isDirty correctly shows "unsaved" if the live
        // content differs from what's actually persisted.
        setSavedContent(dbContent ?? "");
      } catch (err) {
        console.log("Failed to fetch file content:", err);
        isExternalUpdateRef.current = true;
        setSelectedFileContent("");
        setSavedContent("");
      } finally {
        setFileContentLoading(false);
      }
    } else {
      isExternalUpdateRef.current = true;
      const value = contentOrFetcher ?? "";
      setSelectedFileContent(value);
      setSavedContent(value);
    }
  };

  const broadcastContentChange = (content) => {
    if (!fileId) return;

    clearTimeout(contentChangeTimeoutRef.current);
    contentChangeTimeoutRef.current = setTimeout(() => {
      socket.emit("file:content-change", { fileId, content, userId });
    }, 300);
  };

  // The ONLY function tied to Monaco's onChange. Skips broadcasting when the
  // content change was caused by US setting it programmatically (DB load or
  // remote update), so we don't echo stale/duplicate content back to the room.
  const updateDraftContent = (content) => {
    setSelectedFileContent(content);

    if (isExternalUpdateRef.current) {
      isExternalUpdateRef.current = false; // clear so the NEXT real keystroke broadcasts normally
      return;
    }

    broadcastContentChange(content);
  };

  const requestSelectFile = (file, content) => {
    const id = file._id || file.id;
    const sameFile = selectedFile && (selectedFile._id || selectedFile.id) === id;

    if (sameFile) {
      selectFile(file, content);
      return;
    }

    if (isDirty) {
      setPendingAction({ type: "switch", file, content });
    } else {
      selectFile(file, content);
    }
  };

  const closeFile = () => {
    setSelectedFile(null);
    setSelectedFileContent(null);
    setSavedContent(null);
  };

  const requestCloseFile = () => {
    if (isDirty) {
      setPendingAction({ type: "close" });
    } else {
      closeFile();
    }
  };

  const cancelPendingAction = () => setPendingAction(null);

  const markSaved = (content) => {
    setSavedContent(content);
  };

  const value = {
    expanded,
    openMenuFor,
    toggleMenu,
    selectedFile,
    setSelectedFile,
    selectedFileContent,
    updateDraftContent,
    savedContent,
    markSaved,
    isDirty,
    fileContentLoading,
    selectFile,
    requestSelectFile,
    closeFile,
    requestCloseFile,
    pendingAction,
    cancelPendingAction,
    fileViewers,
  };

  return (
    <FileExplorerContext.Provider value={value}>
      {children}
    </FileExplorerContext.Provider>
  );
};