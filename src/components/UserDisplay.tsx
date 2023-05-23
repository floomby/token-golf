import { signIn, signOut, useSession } from "next-auth/react";
import Link from "next/link";
import { useRouter } from "next/router";
import { colorFromFeedbackLevel, FeedbackLevel } from "../lib/feedback";
import Image from "next/image";

// Not named the best, this is the component that displays the users name and the sign in/out button (it goes on the right side of the header)
const UserDisplay: React.FC = () => {
  const { data: session } = useSession();
  const router = useRouter();

  return (
    <>
      {session ? (
        <div className="flex flex-row items-center gap-4">
          <Link
            href={`/users/${session.user.profileId}`}
            className="font-md font-semibold shadow-black transition-all duration-200 ease-in-out hover:scale-105 hover:text-blue-800 hover:text-shadow-lg"
          >
            <div className="flex flex-row items-center gap-4 font-bold text-black">
              <div className="relative h-8 w-8 shrink-0 p-0">
                {session?.user?.image && (
                  <>
                    <div className="absolute left-0 top-0 h-full w-full rounded-full shadow-inner shadow-gray-600 dark:shadow-gray-800"></div>
                    <Image
                      referrerPolicy="no-referrer"
                      className="h-full w-full rounded-full"
                      src={session.user.image}
                      alt="Profile picture"
                      width={32}
                      height={32}
                    />
                  </>
                )}
              </div>
              <span className="hidden sm:flex">{session.user.name}</span>
            </div>
          </Link>
          <div className="dark">
            <button
              className={
                "sm:text-md whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold hover:scale-105" +
                colorFromFeedbackLevel(FeedbackLevel.Error, true)
              }
              onClick={() => void signOut()}
            >
              Sign Out
            </button>
          </div>
        </div>
      ) : (
        <div className="flex flex-row items-center gap-4">
          <div className="dark">
            <button
              className={
                "sm:text-md whitespace-nowrap rounded-full px-4 py-2 text-sm font-bold hover:scale-105" +
                colorFromFeedbackLevel(FeedbackLevel.Success, true) +
                (router.pathname.includes("/challenges/")
                  ? " animate-subtle-bounce"
                  : "")
              }
              onClick={() => void signIn()}
            >
              Sign In
            </button>
          </div>
        </div>
      )}
    </>
  );
};

export default UserDisplay;
