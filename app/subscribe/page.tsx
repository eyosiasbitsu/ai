import axios from "axios";
import SubscribeClient from "./components/subscribe-client";
import { auth, redirectToSignIn } from "@clerk/nextjs";

export default async function SubscribePage() {
  const { userId } = auth();


  return <SubscribeClient userId={userId || ""} />;
}
