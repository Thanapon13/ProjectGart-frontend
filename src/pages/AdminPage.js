import { RiDeleteBin5Fill } from "react-icons/ri";
import { BsFillFilePostFill } from "react-icons/bs";
import { FaRegUser, FaHistory, FaRegCommentAlt } from "react-icons/fa";
import { AiOutlineCaretDown, AiOutlineCaretUp } from "react-icons/ai";
import usePost from "../hooks/usePost";
import ModalConfirmSave from "../components/modal/ModalConfirmSave";
import { useEffect, useRef, useState } from "react";
import ModalSuccess from "../components/modal/ModalSuccess";
import useLoading from "../hooks/useLoading";
import {
  deletePost,
  deleteUser,
  deleteTag,
  deleteRestoredPost,
  restoredPost,
  updateStatusPostHidePost,
  updateStatusPostShowPost,
  updateStatusBanUser,
  unbannedUser
} from "../apis/admin-api";
import { createTage } from "../apis/tag-api";
import FromTable from "../components/FromTable";
import useAuth from "../hooks/useAuth";
import useTag from "../hooks/useTag";
import useAdmin from "../hooks/useAdmin";
import { toast } from "react-toastify";
import validateCreateTag from "../validators/validate-createTag";
import Modal from "../components/modal/Modal";
import FromCreateTag from "../feature/admin/FromCreateTag";
import FromTagData from "../feature/admin/FromTagData";
import { useNavigate } from "react-router-dom";
import axios from "../config/axios";
import FromTableComment from "../feature/admin/FromTableComment";
import Layout from "../layouts/layout";

export default function AdminPage() {
  const inputImg = useRef();

  const navigate = useNavigate();

  const { postData, setPostData } = usePost();
  // console.log("postData:", postData);

  const { getUsers, setGetUsers, authenticateUser, setAuthenticatedUser } =
    useAuth();
  const adminUserId = authenticateUser?.id;
  // console.log("authenticateUser:", authenticateUser);
  // console.log("getUsers:", getUsers);

  const filteredUsers = getUsers.filter(
    user => user.id !== authenticateUser.id
  );
  // console.log("filteredUsers:", filteredUsers);

  const { dataTag, setDataTag } = useTag();
  // console.log("dataTag:", dataTag);

  const { restoredData, setRestoredData, commentData, setCommentData } =
    useAdmin();
  // console.log("restoredData:", restoredData);
  // console.log("commentData:", commentData);

  const { startLoading, stopLoading } = useLoading();

  const mocDataHistoryName = ["HistoryPost", "HistoryUser"];
  // console.log("mocDataHistoryName:", mocDataHistoryName);

  const [selectedMenu, setSelectedMenu] = useState("post");
  // console.log("selectedMenu:", selectedMenu);

  const [showModalDeletePost, setShowModalDeletePost] = useState(false);
  const [showModalBanUser, setShowModalBanUser] = useState(false);
  const [showModalUnbanned, setShowModalUnbanned] = useState(false);
  const [showModalDeleteUser, setShowModalDeleteUser] = useState(false);
  const [showModalSuccess, setShowModalSuccess] = useState(false);
  const [postDeleteSuccess, setPostDeleteSuccess] = useState(false);
  const [userDeleteSuccess, setUserDeleteSuccess] = useState(false);
  const [showModalDeleteTag, setShowModalDeleteTag] = useState(false);
  const [showModalRestoredPost, setShowModalRestoredPost] = useState(false);

  const [userToUpdate, setUserToUpdate] = useState([]);

  const [openTag, setOpenTag] = useState(false);
  const [
    showModalDeleteRestoredPosSuccess,
    setShowModalDeleteRestoredPosSuccess
  ] = useState(false);

  // Post
  const [postIdToDelete, setPostIdToDelete] = useState(null);
  const [userIdToDelete, setUserIdToDelete] = useState(null);
  const [tagIdToDelete, setTagIdToDelete] = useState(null);

  // User
  const [userId, setUserId] = useState(null);
  // console.log("userId:", userId);

  // Tag
  const [tagIdDelete, setTagIdDelete] = useState(null);

  // History
  const [openHistory, setOpenHistory] = useState(false);
  const [adminHistoryRestoreId, setAdminHistoryRestoreId] = useState([]);

  const tagId = tagIdDelete;

  const imageTypes = ["image/png", "image/jpeg"];
  const [arrayImage, setArrayImage] = useState([]);

  const [arrayImageURL, setArrayImageURL] = useState([]);

  const [input, setInput] = useState({
    TagName: "",
    image: ""
  });
  const [error, setError] = useState({});
  const handleChangeInput = e => {
    setInput({ ...input, [e.target.name]: e.target.value });
  };

  const handleImageChange = e => {
    const fileList = e.target.files;
    // console.log("fileList:", fileList);

    const cloneFile = [...arrayImage];
    // console.log("cloneFile:", cloneFile);

    for (let i = 0; i < fileList.length; i++) {
      if (!imageTypes.includes(fileList[i].type)) {
        toast.warn(`${fileList[i].name} is wrong file type!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      } else if (cloneFile.length >= 1) {
        toast.warn(`Your images are more than 1!`, {
          position: "top-right",
          autoClose: 5000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          theme: "light"
        });
      } else {
        cloneFile.push({ image: fileList[i] });
        // cloneFile.push(fileList[i]);
      }
    }
    setArrayImage(cloneFile);
    setInput(prevInput => ({
      ...prevInput,
      image: cloneFile
    }));
  };

  const deleteImg = idx => {
    let clone = [...arrayImage];
    clone.splice(idx, 1);
    setArrayImage(clone);
  };

  useEffect(() => {
    if (arrayImage.length < 1) return;
    const newImageUrls = [];
    // console.log(arrayImage);
    arrayImage.forEach(img => {
      console.log("img:", img);
      if (img._id) {
        newImageUrls.push(`http://localhost:4000/images/${img.image}`);
      } else {
        newImageUrls.push(URL.createObjectURL(img.image));
      }
    });
    // console.log("newImageUrls:", newImageUrls);
    setArrayImageURL(newImageUrls);
  }, [arrayImage]);

  const handleCreateTag = async () => {
    try {
      const result = validateCreateTag(input);

      if (result) {
        setError(result);
      } else {
        setError({});

        startLoading();
        let formData = new FormData();

        formData.append("TagName", input.TagName);

        for (let i = 0; i < arrayImage.length; i++) {
          formData.append("image", arrayImage[i].image);
        }
        const response = await createTage(formData);

        const newTag = response.data.tag;

        setDataTag(prevDataTag => [...prevDataTag, newTag]);

        setInput({
          TagName: "",
          image: ""
        });
        setArrayImage([]);
        stopLoading();

        setOpenTag(false);
        setShowModalSuccess(true);
      }
    } catch (err) {
      toast.error(err.response?.data.message);
    }
  };

  const handleClickDeleteTage = async () => {
    startLoading();
    await deleteTag(tagId);

    setDataTag(prevDataTag => prevDataTag.filter(tag => tag.id !== tagId));

    stopLoading();
    setShowModalSuccess(true);
  };

  const icon = <RiDeleteBin5Fill />;

  const handleMenuClick = menu => {
    setSelectedMenu(menu);
  };

  const handleClickDeletePost = async () => {
    try {
      startLoading();
      const postToDelete = postData.find(post => post.id === postIdToDelete);

      await deletePost({
        id: postIdToDelete,
        userId: userIdToDelete,
        tagId: tagIdToDelete
      });
      stopLoading();

      setPostData(prevPostData =>
        prevPostData.filter(post => post.id !== postIdToDelete)
      );
      setRestoredData(prevRestoredData => [...prevRestoredData, postToDelete]);

      await setShowModalSuccess(true);
      await setPostDeleteSuccess(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleRestoredPost = async () => {
    try {
      startLoading();
      const restoredPostData = restoredData.find(
        post => post.id === adminHistoryRestoreId
      );
      // console.log("restoredPostData:", restoredPostData);
      // console.log("adminHistoryRestoreId:", adminHistoryRestoreId);
      setPostData(prevPostData => [...prevPostData, restoredPostData]);

      await restoredPost(adminHistoryRestoreId, postData);
      stopLoading();

      setRestoredData(prevPostData =>
        prevPostData.filter(post => post.id !== adminHistoryRestoreId)
      );

      setShowModalRestoredPost(false);
      setShowModalSuccess(true);
      navigate(0);
    } catch (err) {
      console.log(err);
    }
  };

  const handleDeleteRestoredPost = async () => {
    try {
      startLoading();
      const restoredPostData = restoredData.find(
        post => post.id === adminHistoryRestoreId
      );
      await deleteRestoredPost(restoredPostData.id);
      stopLoading();

      await setRestoredData(prevPostData =>
        prevPostData.filter(post => post.id !== adminHistoryRestoreId)
      );

      setShowModalDeleteRestoredPosSuccess(false);
      setShowModalSuccess(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickDeleteUser = async () => {
    try {
      startLoading();
      await deleteUser(userId);
      stopLoading();

      await setGetUsers(prevPostData =>
        prevPostData.filter(user => user.id !== userId)
      );

      setShowModalSuccess(true);
      setUserDeleteSuccess(true);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickBanUser = async () => {
    try {
      const response = await axios.post(
        `/admin/user/updateStatusBanUser/${userId}`,
        adminUserId
      );

      // console.log("response:", response.data.userData);

      const updatedUsers = response.data.userData;
      const userToUpdate = updatedUsers.find(user => user.id === userId);
      // console.log("userToUpdate:", userToUpdate);

      setGetUsers(updatedUsers);
      // setAuthenticatedUser(userToUpdate);
      // setUserToUpdate(userToUpdate);
    } catch (err) {
      console.log(err);
    }
  };

  const handleClickUnbannedUser = async () => {
    try {
      let value = {
        status: "SHOWUSER",
        userId: userId
      };

      console.log("value:", value);
      const response = await unbannedUser(value);

      console.log("response:", response.data);

      const updatedUsers = response.data.userData;

      setGetUsers(updatedUsers);
    } catch (err) {
      console.log(err);
    }
  };

  useEffect(() => {
    if (postDeleteSuccess || userDeleteSuccess || showModalSuccess) {
      const timer = setTimeout(() => {
        setShowModalSuccess(false);
        setPostDeleteSuccess(false);
        setUserDeleteSuccess(false);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [
    postDeleteSuccess,
    setUserDeleteSuccess,
    userDeleteSuccess,
    showModalSuccess
  ]);

  const handleClickLikeButton = async postId => {
    const isCheckStatus = postData.find(
      el => el.id === postId && el.status === "SHOWPOST"
    );
    // console.log("isCheckStatus:", isCheckStatus);

    if (isCheckStatus) {
      console.log("postId:", postId);
      await updateStatusPostHidePost(postId);

      setPostData(prevPostData => {
        return prevPostData.map(post => {
          if (post.id === postId) {
            post.status = "HIDEPOST";
          }
          return post;
        });
      });
    } else {
      await updateStatusPostShowPost(postId);
      setPostData(prevPostData => {
        return prevPostData.map(post => {
          if (post.id === postId) {
            post.status = "SHOWPOST";
          }
          return post;
        });
      });
    }
  };

  return (
    <div className="w-full flex">
      <div className="w-1/5 px-3 py-4 overflow-y-auto bg-gray-50 dark:bg-gray-800">
        <ul className="space-y-2 font-medium">
          <li>
            <button
              href="#"
              className={`w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group ${
                selectedMenu === "post" ? "bg-gray-300" : null
              }`}
              onClick={() => handleMenuClick("post")}
            >
              <BsFillFilePostFill />
              <span className="ms-3">Post</span>
            </button>
          </li>

          <li>
            <button
              href="#"
              className={`w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group ${
                selectedMenu === "comment" ? "bg-gray-300" : null
              }`}
              onClick={() => handleMenuClick("comment")}
            >
              <FaRegCommentAlt />
              <span className="ms-3">Comment</span>
            </button>
          </li>

          <li>
            <button
              href="#"
              className={`w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group ${
                selectedMenu === "user" ? "bg-gray-300" : null
              }`}
              onClick={() => handleMenuClick("user")}
            >
              <FaRegUser />
              <span className="ms-3">User</span>
            </button>
          </li>

          <li>
            <button
              href="#"
              className={`w-full flex items-center p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group ${
                selectedMenu === "tag" ? "bg-gray-300" : null
              }`}
              onClick={() => handleMenuClick("tag")}
            >
              <FaRegUser />
              <span className="ms-3">Tag</span>
            </button>
          </li>

          {/* <li>
            <button
              onClick={() => {
                handleMenuClick("history");
                setOpenHistory(prev => !prev);
              }}
              className={`w-full flex items-center justify-start p-2 text-gray-900 rounded-lg dark:text-white hover:bg-gray-200 dark:hover:bg-gray-700 group ${
                selectedMenu === "history" ? "bg-gray-300" : null
              }`}
            >
              <div className="w-full flex items-center justify-between">
                <p className="flex items-center gap-2">
                  <span>
                    <FaHistory />
                  </span>{" "}
                  Deletion History
                </p>
              </div>
            </button>
          </li> */}
        </ul>
      </div>

      {/* Post  */}
      {selectedMenu === "post" && (
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-center items-center font-bold text-2xl">
            <h1>List Post : {postData.length}</h1>
          </div>

          <FromTable
            titleImage="Image"
            titleName="Name"
            titleOwner="Owner"
            titlePostDate="Post Date"
            status="status"
            data={postData}
            setShowModal={setShowModalDeletePost}
            showModal={showModalDeletePost}
            onPostId={setPostIdToDelete}
            onUserId={setUserIdToDelete}
            onTagId={setTagIdToDelete}
            icon={icon}
            handleClickLikeButton={handleClickLikeButton}
          />
        </div>
      )}

      {/* Comment  */}
      {selectedMenu === "comment" && (
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-center items-center font-bold text-2xl">
            <h1>List Comments : {commentData.length}</h1>
          </div>

          <FromTableComment
            data={commentData}
            setCommentData={setCommentData}
          />
        </div>
      )}

      {/* User  */}
      {selectedMenu === "user" && (
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-center items-center font-bold text-2xl">
            <h1>List User : {filteredUsers.length}</h1>
          </div>

          <FromTable
            titleImage="Image"
            titleName="Name"
            titleEmail="Email"
            titleLastLogin="Last logged in"
            data={filteredUsers}
            userId={setUserId}
            isCheck="isCheck"
            icon={icon}
            setShowModal={setShowModalDeleteUser}
            setShowModalBanUser={setShowModalBanUser}
            showModalBanUser={showModalBanUser}
            setShowModalUnbanned={setShowModalUnbanned}
            showModalUnbanned={showModalUnbanned}
          />
        </div>
      )}

      {/* Tag  */}
      {selectedMenu === "tag" && (
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-center items-center font-bold text-2xl">
            <h1>List Tag : {dataTag.length}</h1>
          </div>

          <FromTagData
            dataTag={dataTag}
            setOpenTag={() => setOpenTag(true)}
            setTagIdDelete={setTagIdDelete}
            setShowModalDeleteTag={setShowModalDeleteTag}
            showModalDeleteTag={showModalDeleteTag}
          />
        </div>
      )}

      {/* History */}
      {selectedMenu === "history" && (
        <div className="w-full flex flex-col gap-4 p-4">
          <div className="flex justify-center items-center font-bold text-2xl">
            <h1>
              Displays a list of restored Post history : {restoredData.length}
            </h1>
          </div>
          <FromTable
            titleImage="Image"
            titleName="Name"
            titleOwner="Owner"
            titlePostDate="Post Date"
            data={restoredData}
            setShowModal={setShowModalRestoredPost}
            setShowModalDeleteRestoredPosSuccess={
              setShowModalDeleteRestoredPosSuccess
            }
            showModal={showModalRestoredPost}
            showModalDeleteRestoredPosSuccess={
              showModalDeleteRestoredPosSuccess
            }
            onPostId={setPostIdToDelete}
            onUserId={setUserIdToDelete}
            onTagId={setTagIdToDelete}
            icon={icon}
            isCheckHistory="isCheckHistory"
            setAdminHistoryRestoreId={setAdminHistoryRestoreId}
            handleDeleteRestoredPost={handleDeleteRestoredPost}
          />
        </div>
      )}

      {showModalDeletePost && (
        <ModalConfirmSave
          isVisible={showModalDeletePost}
          onClose={() => setShowModalDeletePost(false)}
          onSave={handleClickDeletePost}
          header="Delete post"
          text='Do you want to "delete post"?'
        />
      )}

      {showModalBanUser && (
        <ModalConfirmSave
          isVisible={showModalBanUser}
          onClose={() => setShowModalBanUser(false)}
          onSave={handleClickBanUser}
          header="Ban User"
          text='Do you want to "Ban User"?'
        />
      )}
      {showModalUnbanned && (
        <ModalConfirmSave
          isVisible={showModalUnbanned}
          onClose={() => setShowModalUnbanned(false)}
          onSave={handleClickUnbannedUser}
          header="Unbanned User"
          text='Do you want to "Unbanned User"?'
        />
      )}

      {showModalDeleteUser && (
        <ModalConfirmSave
          isVisible={showModalDeleteUser}
          onClose={() => setShowModalDeleteUser(false)}
          onSave={handleClickDeleteUser}
          header="Delete user"
          text='Do you want to "delete user"?'
        />
      )}

      {showModalDeleteTag && (
        <ModalConfirmSave
          isVisible={showModalDeleteTag}
          onClose={() => setShowModalDeleteTag(false)}
          onSave={handleClickDeleteTage}
          header="Delete Tag"
          text='Do you want to "delete" it?'
        />
      )}

      {showModalRestoredPost && (
        <ModalConfirmSave
          isVisible={showModalRestoredPost}
          onClose={() => setShowModalRestoredPost(false)}
          onSave={handleRestoredPost}
          header="Restored Post"
          text='Do you want to "Restored Post" it?'
        />
      )}

      {showModalDeleteRestoredPosSuccess && (
        <ModalConfirmSave
          isVisible={showModalDeleteRestoredPosSuccess}
          onClose={() => setShowModalDeleteRestoredPosSuccess(false)}
          onSave={handleDeleteRestoredPost}
          header="Delete Restored Post"
          text='Do you want to "Delete Restored Post" it?'
        />
      )}

      {openTag && (
        <Modal
          id="showViewImageModal"
          width={"[100px]"}
          isVisible={openTag}
          onClose={() => setOpenTag(false)}
          header={"Create Tag"}
        >
          <FromCreateTag
            error={error}
            inputImg={inputImg}
            handleImageChange={handleImageChange}
            arrayImage={arrayImage}
            arrayImageURL={arrayImageURL}
            deleteImg={deleteImg}
            input={input}
            handleChangeInput={handleChangeInput}
            handleCreateTag={handleCreateTag}
            setOpenTag={() => setOpenTag(false)}
          />
        </Modal>
      )}

      {showModalSuccess && <ModalSuccess />}
    </div>
  );
}
