/**
 * Turns a flat [{ _id, parentId, type, name, ... }] list (what /file/project/:id
 * returns) into a nested tree. parentId === null (or undefined) means root-level.
 */
export const buildTree = (items, parentId = null) =>
  items
    .filter((item) => (item.parentId || null) === parentId)
    .map((item) => ({
      ...item,
      children: item.type === 'folder' ? buildTree(items, item._id) : []
    }));