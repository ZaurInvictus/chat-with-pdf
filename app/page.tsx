import { ChatWindow } from "@/components/ChatWindow";
import { GuideInfoBox } from "@/components/guide/GuideInfoBox";

//export default function AgentsPage() {
export default function Home() {
  const InfoCard = (
    <GuideInfoBox>
      <h1>Upload your PDF to chat with it</h1>
    </GuideInfoBox>
  );
  return (
    <ChatWindow
      endpoint="api/chat"
      emptyStateComponent={InfoCard}
      showIngestForm={true}
      placeholder={"Ask anything about your document."}
      emoji="🐶"
    />
  );
}
