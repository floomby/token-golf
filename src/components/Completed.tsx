import { FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { useRouter } from "next/router";
import ClampText from "./ClampText";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type CompletedProps = {
  userId: string;
};
const Completed: React.FC<CompletedProps> = ({ userId }) => {
  const router = useRouter();

  const notifications = useNotificationQueue();

  const { data: runs } = api.challenge.getUserCompleted.useQuery(userId, {
    enabled: !!userId,
    onError: (error) => {
      const id = Math.random().toString(36).substring(7);
      notifications.add(id, {
        message: error.message,
        level: FeedbackLevel.Error,
        duration: 5000,
      });
    },
  });

  return (
    <div className="m-4 flex h-full w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-4 dark:bg-gray-800">
      <h1 className="text-2xl font-semibold">Completed Challenges</h1>
      {!!runs ? (
        <table className="w-full table-auto">
          <thead className="text-left">
            <tr>
              <th className="px-2 py-1">Challenge</th>
              <th className="px-2 py-1">Points</th>
              <th className="px-2 py-1">Tokens</th>
              <th className="px-2 py-1">Date</th>
            </tr>
          </thead>
          <tbody>
            {runs?.map((run, i) => {
              return (
                <tr
                  key={i}
                  className="cursor-pointer bg-stone-300 bg-opacity-30 transition-all duration-200 ease-in-out hover:bg-stone-300 dark:hover:bg-stone-700"
                  onClick={() => {
                    void router.push(
                      `/challenges/${run.challenge.id.toString()}/${run.runId}`
                    );
                  }}
                >
                  <td
                    className="pl-1 transition-all duration-200 ease-in-out hover:text-blue-500"
                    onClick={(e) => {
                      e.stopPropagation();
                      void router.push(`/overviews/${run.challenge.id.toString()}/`);
                    }}
                  >
                    <ClampText
                      text={`${run.challenge.name} - ${run.challenge.description}`}
                      maxLength={45}
                    />
                  </td>
                  <td className="pl-2">
                    {run.score > 0 ? (
                      <span className="flex flex-row text-green-500">
                        <FontAwesomeIcon
                          icon={faTrophy}
                          className="mr-1 h-4 w-4 translate-y-[4.5px] text-yellow-600 dark:text-yellow-500"
                        />
                        {run.score.toString()}
                      </span>
                    ) : null}
                  </td>
                  <td className="pl-1">{run.tokenCount}</td>
                  <td className="pl-1">{run.at.toLocaleString()}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Completed;
