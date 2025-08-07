// function that create dowmload url from firebase storage path

import { ref, getDownloadURL } from "firebase/storage";
import { projectStorage } from "../firebase-config";

export const getDownloadUrl = async (path: string) => {
  const storageRef = ref(projectStorage, path);
  const url = await getDownloadURL(storageRef);
  return url;
};
