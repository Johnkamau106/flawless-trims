import axios from "axios";

const api = axios.create({
  baseURL: "/api",
  timeout: 60000,
});

export const fetchVideoMetadata = async (url) => {
  const { data } = await api.post("/inspect", { url });
  return data;
};

export const downloadMedia = async (payload) => {
  const { data } = await api.post("/download", payload, {
    responseType: "blob",
  });
  return data;
};

export const fetchClips = async () => {
  const { data } = await api.get("/clips");
  return data;
};

export const saveClip = async (clip) => {
  const { data } = await api.post("/clip", clip);
  return data;
};

