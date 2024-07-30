"use client";
import MyApi from "@/api/MyApi";
import * as Yup from "yup";
import { RootState } from "@/redux/store";
import { ErrorMessage, Field, Form, Formik, FormikHelpers } from "formik";
import { useRouter } from "next/navigation";
import React, { useEffect, useRef, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { io, Socket } from "socket.io-client";

interface ChatMessageInterface {
  applicationId: string;
  content: string;
}

interface FormValuesInterface {
  message: string;
}

// let socket: Socket | null = null;

// const socket = io("http://localhost:5010");

const ChatPage = () => {
  const router = useRouter();
  const dispatch = useDispatch();
  const { isChat, chatApplicationId } = useSelector(
    (state: RootState) => state.chat
  );
  const token = localStorage.getItem("login_token");

  const [isConnected, setIsConnected] = useState<boolean>(false);
  const [messagesList, setMessagesList] = useState<ChatMessageInterface[]>([]);
  const [isRoomJoined, setIsRoomJoined] = useState<boolean>(false);

  const socket = useRef<Socket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const getMyApplications = async () => {
      try {
        const endPoint = `chat/${chatApplicationId}`;

        const response = await MyApi.get(endPoint, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        console.log(response.data?.data);
        setMessagesList(response.data?.data?.messages);
      } catch (err: any) {
        console.error("Get Chat History:", err.response.data);
      }
    };

    getMyApplications();
  }, [chatApplicationId, token]);

  useEffect(() => {
    if (chatApplicationId) {
      const newSocket = io("http://localhost:5010", {
        transports: ["websocket"], // Use WebSocket transport
        auth: {
          token: `Bearer ${token}`,
        },
      });

      socket.current = newSocket;

      const handleConnect = () => {
        console.log("Connected to WebSocket server");
        setIsConnected(true);
      };

      const handleDisconnect = (reason: any) => {
        console.log("Disconnected from WebSocket server, Reason:", reason);
        setIsConnected(false);
      };

      const handleError = (err: any) => {
        console.error("Connection Error:", err);
      };
      console.log("chatApplicationId", chatApplicationId);

      newSocket.emit("joinRoom", chatApplicationId);

      const handleRoomJoined = () => {
        setIsRoomJoined(!isRoomJoined);
        // setLoading(false);
      };

      const handleMessageReceived = (message: ChatMessageInterface) => {
        console.log("Received message:", message); // Debug log
        setMessagesList((prevMessages) => [...prevMessages, message]);
      };

      // newSocket.emit("getChatHistory", chatApplicationId);

      newSocket.on("connect", handleConnect);
      newSocket.on("disconnect", handleDisconnect);
      newSocket.on("connect_error", handleError);

      newSocket.on("roomJoined", handleRoomJoined);
      newSocket.on("receiveMessage", handleMessageReceived);

      return () => {
        newSocket.off("connect", handleConnect);
        newSocket.off("disconnect", handleDisconnect);
        newSocket.off("connect_error", handleError);

        newSocket.off("roomJoined", handleRoomJoined);
        newSocket.off("receiveMessage", handleMessageReceived);
      };
    }
  }, [chatApplicationId]);

  useEffect(() => {
    if (!isChat && !chatApplicationId) {
      router.push("/");
      console.log(isChat);
    }
  }, [chatApplicationId, isChat, router]);

  useEffect(() => {
    messagesEndRef.current?.scrollTo({
      top: messagesEndRef.current.scrollHeight,
      behavior: "smooth",
      // top: 100000000000,
      // behavior: "smooth",
    });
  }, [messagesList, chatApplicationId, isChat]);

  const sendMessage = (
    values: FormValuesInterface,
    { resetForm }: FormikHelpers<FormValuesInterface>
  ) => {
    const chatMessage: ChatMessageInterface = {
      applicationId: chatApplicationId,
      content: values.message,
    };

    if (chatMessage.content.trim() === "") return;

    console.log("message: ", chatMessage, "message list: ", messagesList);
    if (socket.current) {
      socket.current.emit("sendMessage", chatMessage);
    } else {
      console.error("Socket is not initialized");
    }

    resetForm();
    // setNewMessage("");
  };

  const initialValues: FormValuesInterface = {
    message: "",
  };

  return (
    <div className="chat-page">
      {isChat && chatApplicationId ? (
        <div className="chat-wrapper">
          {/* <h2>Chat Room: {chatApplicationId}</h2> */}
          {!isRoomJoined && (
            <p className="flex justify-center items-center h-full">
              Joining room...
            </p>
          )}
          {isRoomJoined && (
            <div className="chat-container">
              <div>
                <div className="message-list s-bar" ref={messagesEndRef}>
                  {messagesList.map((msg, i) => {
                    return (
                      <div className={`message`} key={i}>
                        <div className="msg-top flex justify-between mb-2">
                          <h5>{"Anonymous"}</h5>
                          <p>{new Date().toLocaleTimeString()}</p>
                        </div>
                        <p>{msg.content}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
              <Formik initialValues={initialValues} onSubmit={sendMessage}>
                {({ isSubmitting, values }) => (
                  <Form className="mt-8">
                    <div>
                      <Field type="text" id="message" name="message" />
                      <button
                        type="submit"
                        disabled={isSubmitting || values.message.trim() === ""}
                      >
                        Send
                      </button>
                    </div>
                  </Form>
                )}
              </Formik>
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
};

export default ChatPage;
