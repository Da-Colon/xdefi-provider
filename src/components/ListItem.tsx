const ListItem = ({ title, info }: { title: string; info: string }) => {
  return (
    <div className="flex justify-between">
      <span className="text-gray-100 mr-4">{title}:</span>
      <span className="text-purple-400">{info}</span>
    </div>
  );
};

export default ListItem;
