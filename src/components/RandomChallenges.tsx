import { useRouter } from "next/router";
import { FeedbackLevel, colorFromFeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRefresh } from "@fortawesome/free-solid-svg-icons";
import ClampText from "./ClampText";

const RandomChallenges: React.FC = () => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const { data: challenges, refetch } = api.challenge.randomChallenges.useQuery(
    undefined,
    {
      onError: (error) => {
        const id = Math.random().toString(36).substring(7);
        notifications.add(id, {
          message: "Error loading challenge: " + error.message,
          level: FeedbackLevel.Error,
          duration: 5000,
        });
      },
      onSuccess: (data) => {
        console.log(data);
      },
      refetchOnWindowFocus: false,
    }
  );

  return (
    <div className="l flex w-full flex-col items-end px-2">
      {!!challenges ? (
        <>
          <button
            className={
              "mt-2 w-8 rounded p-2 hover:scale-110" +
              colorFromFeedbackLevel(FeedbackLevel.Invisible, true)
            }
            onClick={() => {
              void refetch();
            }}
          >
            <FontAwesomeIcon icon={faRefresh} />
          </button>
          <table className="w-full">
            <thead className="text-left">
              <tr>
                <th className="px-2 py-1">Challenge</th>
                <th className="px-2 py-1">Creator</th>
                <th className="px-2 py-1">Creation Date</th>
              </tr>
            </thead>
            <tbody>
              {challenges?.map((challenge, i) => {
                return (
                  <tr
                    key={i}
                    className="cursor-pointer bg-stone-300 bg-opacity-30 transition-all duration-200 ease-in-out hover:bg-stone-200 dark:hover:bg-stone-700"
                    onClick={() => {
                      void router.push(`/overviews/${challenge.id}`);
                    }}
                  >
                    <td className="pl-1">
                      <ClampText
                        text={`${challenge.name} - ${challenge.description}`}
                        maxLength={20}
                      />
                    </td>
                    <td
                      className="pl-1 hover:text-blue-500"
                      onClick={(e) => {
                        void router.push(`/users/${challenge.creator.id}`);
                        e.stopPropagation();
                      }}
                    >
                      {challenge.creator.name}
                    </td>
                    <td className="pl-1">
                      {new Date(challenge.createdAt).toLocaleString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </>
      ) : (
        <div className="flex w-full justify-center">
          <Spinner />
        </div>
      )}
    </div>
  );
};

export default RandomChallenges;
