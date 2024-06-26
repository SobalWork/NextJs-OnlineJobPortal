"use client";
import MyApi from "@/api/MyApi";
import DeleteUserModal from "@/app/modals/DeleteUserModal";
import { logout } from "@/redux/features/auth/authSlice";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch } from "react-redux";

interface ProfileData {
  message: string;
  employerId?: string;
  userId?: string;
  role: string;
  name: string;
  email: string;
  createdAt: string;
  jobPostings: string;
  skills: string[];
  savedJobs: string[];
}

interface UserProfileProps {
  setChangePassword?: React.Dispatch<React.SetStateAction<boolean>>; // Optional prop
}

const UserProfile: React.FC<UserProfileProps> = ({ setChangePassword }) => {
  const [showError, setShowError] = useState<string>("");
  const [apiData, setApiData] = useState<ProfileData | null>(null);

  // for deleting of a user
  const [accountDeleteModal, setAccountDeleteModal] = useState<boolean>(false);

  const handleOpenModal = () => {
    setAccountDeleteModal(true);
  };

  const handleCloseModal = () => {
    setAccountDeleteModal(false);
  };

  const router = useRouter();

  const dispatch = useDispatch();

  const getProfileHandler = async () => {
    try {
      const loginToken = localStorage?.getItem("login_token");
      const userType = localStorage?.getItem("user_role");

      const endPoint =
        userType === "admin"
          ? "/admin/"
          : userType === "employer"
          ? "/employer/"
          : "/job-seeker/";
      const response = await MyApi.get(`${endPoint}/profile`, {
        headers: {
          Authorization: `Bearer ${loginToken}`,
        },
      });
      console.log(response.data);

      setApiData(response.data);
    } catch (err: any) {
      setShowError(err.response.data?.message);
      console.error("Profile error:", err.response.data?.message);
    }
  };

  const deleteProfileHandler = async () => {
    try {
      const loginToken = localStorage?.getItem("login_token");
      const userType = localStorage?.getItem("user_role");

      const endPoint =
        userType === "admin"
          ? "/admin/"
          : userType === "employer"
          ? "/employer/"
          : "/job-seeker/";

      const response = await MyApi.delete(
        `${endPoint}/delete/${apiData?.userId}`,
        {
          headers: {
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );

      localStorage.clear();
      console.log(response.data);
      handleCloseModal();
      router.push("/login");
      dispatch(logout());
    } catch (err: any) {
      setShowError(err.response.data?.message);
      console.error("Delete User error:", err.response.data?.message);
    }
  };

  useEffect(() => {
    getProfileHandler();
  }, []);
  return (
    <div>
      {showError && <p>{showError}</p>}
      <div>
        <h1>Profile</h1>
        {apiData && (
          <div>
            {apiData.role === "job seeker" && <button>Edit Profile</button>}
            <div>
              <p>Name: {apiData.name}</p>
              <p>Email: {apiData.email}</p>
              <p>Role: {apiData.role}</p>
              <p>
                Registration Date:{" "}
                {new Date(apiData.createdAt).toLocaleDateString()}
              </p>
              {/* for employer */}
              {apiData.role === "employer" && (
                <p>
                  Job Postings:{" "}
                  {apiData.jobPostings.length > 0
                    ? apiData.jobPostings
                    : "Empty"}
                </p>
              )}

              {/* for seeker */}
              {apiData.role === "job seeker" && (
                <>
                  <p>
                    Saved Jobs:{" "}
                    {apiData.savedJobs.length > 0 ? apiData.savedJobs : "Empty"}
                  </p>
                  <p>
                    Skills:{" "}
                    {apiData.skills.length > 0 ? apiData.skills : "Empty"}
                  </p>
                </>
              )}
            </div>

            {/* for deletion of a user */}
            <div>
              <div>
                <button
                  onClick={() => {
                    handleOpenModal();
                  }}
                >
                  Delete Account
                </button>
                <DeleteUserModal
                  accountDeleteModal={accountDeleteModal}
                  handleCloseModal={handleCloseModal}
                  deleteProfileHandler={deleteProfileHandler}
                />
              </div>
            </div>

            {/* for password changing */}
            <div>
              <button
                onClick={() => {
                  setChangePassword?.(true);
                }}
              >
                Change Password
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfile;
