const ChatCard = () => {
  return (
    <div className="rounded-sm border border-stroke bg-white p-6 shadow-default dark:border-strokedark dark:bg-boxdark">
      <div className="flex items-center justify-between">
        <div>
          <h4 className="text-title-md font-bold text-black dark:text-white">
            Messages
          </h4>
          <p className="text-sm font-medium">Last 6 months</p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-3">
            <div className="h-3.5 w-3.5 rounded-sm bg-primary"></div>
            <p className="text-sm font-medium">Online</p>
          </div>

          <div className="flex items-center gap-3">
            <div className="h-3.5 w-3.5 rounded-sm bg-meta-3"></div>
            <p className="text-sm font-medium">Stores</p>
          </div>
        </div>
      </div>

      <div className="mt-6 h-60.5">
        <div className="h-full w-full rounded-sm bg-white shadow-default dark:bg-boxdark"></div>
      </div>
    </div>
  );
};

export default ChatCard;
