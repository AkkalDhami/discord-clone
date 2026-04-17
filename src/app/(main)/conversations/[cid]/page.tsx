export default async function Page(props: PageProps<"/conversations/[cid]">) {
  const { cid } = await props.params;

  return (
    <div>
      <h1>Conversation {cid}</h1>
    </div>
  );
}
