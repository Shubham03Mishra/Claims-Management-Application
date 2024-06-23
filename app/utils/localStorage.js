// src/utils/localStorage.js

export const saveData = (key, value) => {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      console.error('Local Storage save failed:', error);
    }
  };
  
  export const loadData = (key) => {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      console.error('Local Storage load failed:', error);
      return null;
    }
  };
  
  export const deleteData = (key) => {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Local Storage delete failed:', error);
    }
  };
  