const entMap = require('../io/entity_map');
const { read, write } = require('../io');

function deleteEntity(realm, type, id) {
  let entity = realm[type][id];
  if (!entity) return false;

  if (entity.children.length) {
    entity.children.forEach(childId => {
      deleteEntity(realm, entMap.child[type], childId);
    });
  }

  // Remove entity
  realm[type][id] = null;
}

module.exports = (type, id) => {
  // Read Database
  let realm = read();

  let entity = realm[type][id];
  // If we don't have an entity, load the kingdoms page
  if (entity === null) return false;
  // Grok the parent
  let parentType = entMap.parent[type];
  let parentId = entity.parentId;

  // Recursively delete children
  deleteEntity(realm, type, id);

  // Remove entity from parent's child object
  if (!isNaN(+parentId)) {
    let childArray = realm[parentType][parentId].children;
    childArray = childArray.splice(childArray.indexOf(+id), 1);
  }

  write(realm);
  return true;
};
