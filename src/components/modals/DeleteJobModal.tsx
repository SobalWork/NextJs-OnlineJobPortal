import MyApi from "@/api/MyApi";
import { waitSec } from "@/utils/CommonWait";
import React, { useState, useEffect } from "react";

interface ModalProps {
  jobDeleteModal: boolean;
  setJobDeleteModal: (value: boolean) => void;
  jobId: string;
}

const DeleteJobModal: React.FC<ModalProps> = ({
  jobDeleteModal,
  setJobDeleteModal,
  jobId,
}) => {
  const [showError, setShowError] = useState<string>("");
  const deleteProfileHandler = async () => {
    try {
      const loginToken = localStorage?.getItem("login_token");
      const userType = localStorage?.getItem("user_role");

      const response = await MyApi.delete(`employer/job-postings/${jobId}`, {
        headers: {
          Authorization: `Bearer ${loginToken}`,
        },
      });

      console.log(response.data);
      setShowError("");
      await waitSec(3000);
      setJobDeleteModal(false);
    } catch (err: any) {
      setShowError(err.response.data?.message);
      console.error("Delete User error:", err.response.data?.message);
    }
  };

  const handleEscape = (event: KeyboardEvent) => {
    if (event.key === "Escape" && jobDeleteModal) {
      setJobDeleteModal(false);
    }
  };

  // Add event listener for escape key press to close modal
  useEffect(() => {
    document.addEventListener("keydown", handleEscape);
    return () => document.removeEventListener("keydown", handleEscape);
  }, [jobDeleteModal]);

  return (
    <div
      className={`modal-container fixed top-0 left-0 w-full h-full bg-gray-900 bg-opacity-75 z-50 flex items-center justify-center ${
        jobDeleteModal ? "block" : "hidden"
      }`}
    >
      <div className="modal-wrapper relative">
        <div className="">
          <div className="flex justify-center flex-col items-center">
            <h3>Are You Sure</h3>
            <p>Confirm to delete your account</p>
          </div>
          <div className="flex justify-between pt-8">
            <button
              onClick={() => {
                setJobDeleteModal(false);
              }}
            >
              Cancel
            </button>
            <button className="del-btn" onClick={deleteProfileHandler}>
              Delete
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteJobModal;
