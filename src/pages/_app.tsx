import { type AppType } from "next/app";
import { type Session } from "next-auth";
import { SessionProvider } from "next-auth/react";

import { api } from "~/utils/api";

import "~/styles/globals.css";
import "react-tooltip/dist/react-tooltip.css";

import { NotificationProvider } from "~/providers/notifications";
import WidthProvider from "~/providers/width";
import NotificationList from "~/components/NotificationList";
import Header from "~/components/Header";

const MyApp: AppType<{ session: Session | null }> = ({
  Component,
  pageProps: { session, ...pageProps },
}) => {
  return (
    <SessionProvider session={session}>
      <NotificationProvider>
        <WidthProvider>
          <div className="absolute inset-0 min-h-screen min-w-max text-black dark:text-white">
            <Header />
            <Component {...pageProps} />
            <NotificationList />
          </div>
        </WidthProvider>
      </NotificationProvider>
    </SessionProvider>
  );
};

export default api.withTRPC(MyApp);
