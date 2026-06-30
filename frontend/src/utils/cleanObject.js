// utils/cleanObject.js
export const cleanObject = (obj) => {
  return Object.fromEntries(
    Object.entries(obj).filter(([_, value]) => {
      return value !== "" && value !== null && value !== undefined;
    })
  );
};
