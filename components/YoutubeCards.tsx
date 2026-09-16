export type Video = {
    name: string;
    link: string;
    title: string;
    description?: string;
    video_attachment: string;
};

type Props = {
    videos: Video[];
};

const YoutubeCards = ({ videos }: Props) => {
    if (!videos || videos.length === 0) return <p className="absolute inset-0 flex justify-center items-center ml-[14%] text-gray-400 text-2xl">No Content</p>;
    return (
        <div className="px-6 py-8">
            {/* <div className="col-span-3 flex lg:justify-between flex-col-reverse lg:flex-row pb-5 gap-5 lg:gap-0">
                <Input
                    className="lg:w-[40%] md:w-full sm:w-full rounded-[20px] bg-[#ecf2ff]"
                    placeholder="Search Vedio ..."
                    name='search_name'
                // onChange={(e) => { handlesearchname(e) }}
                />
            </div> */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {videos.map((video, index) => (
                    <div
                        key={index}
                        className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow duration-300 p-4"
                    >
                        <div className="w-full aspect-video bg-black rounded overflow-hidden mb-3">
                            <video
                                src={video?.video_attachment}
                                controls
                                preload="metadata"
                                className="w-full h-full object-cover"
                                title={video.title}
                            >
                                Your browser does not support the video tag.
                            </video>
                        </div>
                        <h2 className="text-lg font-semibold mb-1">{video.title}</h2>
                        {video.description && (
                            <p className="text-sm text-gray-600">{video.description}</p>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
};

export default YoutubeCards;
