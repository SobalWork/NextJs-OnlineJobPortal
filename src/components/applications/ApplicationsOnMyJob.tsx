"use client";
import MyApi from "@/api/MyApi";
import {
  isChatEnabled,
  setChatApplicationId,
} from "@/redux/features/chatSlicer";
import { RootState } from "@/redux/store";
import Link from "next/link";
import { useRouter } from "next/navigation";
import React, { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";

interface ApplicationParamsInterface {
  jobIdParam: string;
}

interface JobApplicationInterface {
  appId: string;
  appStatus: "pending" | "rejected" | "accepted";
  appCreatedAt: string;
  seekerId: string;
  seekerSkills: string[];
  seekerUserId: string;
  seekerUserName: string;
  seekerUserEmail: string;
}

const ApplicationsOnMyJob: React.FC<ApplicationParamsInterface> = ({
  jobIdParam,
}) => {
  const [showError, setShowError] = useState<string>("");
  const [apiData, setApiData] = useState<JobApplicationInterface[] | []>([]);
  const [appStatus, setAppStatus] = useState<boolean>(false);

  const router = useRouter();
  const dispatch = useDispatch();
  const { isChat, chatApplicationId } = useSelector(
    (state: RootState) => state.chat
  );

  useEffect(() => {
    getApplicationsOnMyJob();
    setAppStatus(false);
  }, [appStatus]);

  const getApplicationsOnMyJob = async () => {
    try {
      const loginToken = localStorage?.getItem("login_token");

      const endPoint = `employer/applications/job/${jobIdParam}`;

      const response = await MyApi.get(endPoint, {
        headers: {
          Authorization: `Bearer ${loginToken}`,
        },
      });
      console.log(response.data);
      setApiData(response.data?.data);
    } catch (err: any) {
      setShowError(err.response.data?.message || err.response.data?.error);
      console.error("Get Applications:", err.response);
    }
  };

  const changeAppStatus = async (
    newStatus: "pending" | "accepted" | "rejected",
    appId: string
  ) => {
    try {
      const loginToken = localStorage?.getItem("login_token");

      const endPoint = `/employer/applications/job/${appId}/status`;

      const response = await MyApi.patch(
        endPoint,
        { status: newStatus },
        {
          headers: {
            Authorization: `Bearer ${loginToken}`,
          },
        }
      );
      console.log(response.data);
      setAppStatus(true);
    } catch (err: any) {
      setShowError(err.response.data?.message || err.response.data?.error);
      console.error("Set Applications Status:", err.response);
    }
  };

  const chatHandler = () => {
    dispatch(isChatEnabled(!isChat));
    router.push("/chat");
  };

  return (
    <div className="my-job-applications pt-8">
      {apiData.length > 0 ? (
        <div>
          {showError && <p>{showError}</p>}
          <h2 className="">Job Applications</h2>
          <div className="app-card">
            {apiData.map((app: JobApplicationInterface) => {
              return (
                <div key={app.appId} className="">
                  <Link href={`/user/job-seeker/${app.seekerId}`}>
                    <h3>{app?.seekerUserName}</h3>
                    <div>
                      <p>
                        Applied At:{" "}
                        <span>
                          {new Date(app?.appCreatedAt).toLocaleDateString()}
                        </span>
                      </p>
                    </div>
                    <div>
                      <p>
                        Email: <span>{app?.seekerUserEmail}</span>
                      </p>
                    </div>
                    <div>
                      <p>
                        Status:{" "}
                        <span className="capitalize">{app?.appStatus}</span>
                      </p>
                    </div>
                  </Link>
                  <div className="flex justify-between gap-3 pt-4">
                    {app.appStatus == "accepted" ? (
                      <button
                        onClick={() => {
                          chatHandler();
                          dispatch(setChatApplicationId(app.appId));
                        }}
                      >
                        Chat Now
                      </button>
                    ) : app.appStatus == "rejected" ? null : (
                      <>
                        <button
                          onClick={() => changeAppStatus("accepted", app.appId)}
                        >
                          Accept
                        </button>

                        <button
                          onClick={() => changeAppStatus("rejected", app.appId)}
                        >
                          Reject
                        </button>
                      </>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <p>Application not found</p>
      )}
    </div>
  );
};

export default ApplicationsOnMyJob;
