import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { storage } from "./firebase";

export const uploadImage = async (uri: string, path: string) => {
  const response = await fetch(uri);
  const blob = await response.blob();

  const storageRef = ref(storage, path);

  await uploadBytes(storageRef, blob);

  const downloadURL = await getDownloadURL(storageRef);

  return downloadURL;
};