import { FeedbackLevel } from "~/lib/feedback";
import { useNotificationQueue } from "~/providers/notifications";
import { api } from "~/utils/api";
import Spinner from "./Spinner";
import { useRouter } from "next/router";
import ClampText from "./ClampText";
import { faTrophy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import Link from "next/link";

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
    <div className="flex md:h-full w-full flex-col items-start justify-start rounded-lg bg-zinc-200 p-2 dark:bg-gray-800 md:p-4">
      <h1 className="text-2xl font-semibold">Completed Challenges</h1>
      {!!runs ? (
        <div className="flex w-full flex-row overflow-x-auto">
          <table className="grow table-auto">
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
                  >
                    <td>
                      <Link
                        href={`/challenges/${run.challenge.id.toString()}/${
                          run.runId
                        }`}
                        className="flex whitespace-nowrap px-2 transition-all duration-200 ease-in-out"
                        onClick={(e) => {
                          e.stopPropagation();
                          void router.push(
                            `/overviews/${run.challenge.id.toString()}/`
                          );
                        }}
                      >
                        <ClampText
                          text={`${run.challenge.name} - ${run.challenge.description}`}
                          maxLength={45}
                        />
                      </Link>
                    </td>
                    <td>
                      {run.score > 0 ? (
                        <Link
                          className="flex flex-row px-2 text-green-500"
                          href={`/challenges/${run.challenge.id.toString()}/${
                            run.runId
                          }`}
                        >
                          <FontAwesomeIcon
                            icon={faTrophy}
                            className="mr-1 h-4 w-4 translate-y-[4.5px] text-yellow-600 dark:text-yellow-500"
                          />
                          {run.score.toString()}
                        </Link>
                      ) : (
                        <Link
                          href={`/challenges/${run.challenge.id.toString()}/${
                            run.runId
                          }`}
                          className="flex px-2 text-gray-500 dark:text-gray-400"
                        >
                          {"-"}
                        </Link>
                      )}
                    </td>
                    <td>
                      <Link
                        href={`/challenges/${run.challenge.id.toString()}/${
                          run.runId
                        }`}
                        className="flex px-2"
                      >
                        {run.tokenCount}
                      </Link>
                    </td>
                    <td>
                      <Link
                        href={`/challenges/${run.challenge.id.toString()}/${
                          run.runId
                        }`}
                        className="flex whitespace-nowrap px-2"
                      >
                        {run.at.toLocaleString()}
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <Spinner />
      )}
    </div>
  );
};

export default Completed;
