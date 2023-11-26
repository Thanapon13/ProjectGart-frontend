import axios from "../config/axios";

export const CreatePost = formData => axios.post("/post/createPost", formData);

export const getDataPost = () => axios.get("/post/getCreatePost");
export const getPostImageById = userId =>
  axios.get(`/post/getPostImageById/${userId}`);