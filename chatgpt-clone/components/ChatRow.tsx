import { ChatBubbleLeftIcon, TrashIcon } from "@heroicons/react/24/outline";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { useEffect, useState } from "react";
import { useCollection } from "react-firebase-hooks/firestore";
import { collection, Query, query, orderBy, deleteDoc, doc } from "firebase/firestore";
import { db } from "../firebase";

type Props = {
  id: string;
};

function ChatRow({ id }: Props) {
  const pathname = usePathname();
  const router = useRouter();
  const { data: session } = useSession();
  const [active, setActive] = useState(false);
  const [messages] = useCollection(
    query(collection(db, "users", session?.user?.email!, "chats", id, "messages"),
    orderBy("createdAt", "asc"))
  );
  useEffect(() => {
    if (!pathname) return;

    setActive(pathname.includes(id));
  }, [pathname]);

  // Log the message data
  useEffect(() => {
    if (messages) {
      messages.docs.forEach((message, index) => {
        //console.log(`Chatrow Message ${index + 1}:`, message.data());
      });
    }
  }, [messages]);

  const removeChat = async () => {
    const shouldDelete = confirm("Are you sure you want to delete this chat?");
    if (shouldDelete) {
      await deleteDoc(doc(db, "users", session?.user?.email!, "chats", id));
      router.replace("/");
    }
  };

  const lastMessageData = messages?.docs?.[messages.docs.length - 1]?.data();
  const firstMessageData = messages?.docs?.[0]?.data();

  const firstMessageText = typeof firstMessageData?.text === 'string' ? firstMessageData.text.substring(0, 40) : '';
  
  console.log("firstMessageText: " + firstMessageText);

  return (
    <Link
      href={`/chat/${id}`}
      className={`chatRow justify-center mt-3 ${active && "bg-gray-700/50"}`}
    >
      <ChatBubbleLeftIcon className="h-5 w-5" />

      <p className="flex-1 truncate">
        {firstMessageText}
      </p>

      <TrashIcon
        onClick={removeChat}
        className="h-5 w-5 transition-all duration-200 text-gray-700 hover:text-red-700"
      />
    </Link>
  );
}

export default ChatRow;