import logo from "../assets/logo-mascotte.png";
import { SidebarTitle } from "./SidebarTitle";
import { TransitionNavLink } from "./TransitionNavLink";
import Workflow from "lucide-react/icons/workflow";
import Sailboat from "lucide-react/icons/sailboat";
import Play from "lucide-react/icons/play";
import Box from "lucide-react/icons/box";
import Settings2 from "lucide-react/icons/settings-2";
import Layers from "lucide-react/icons/layers";
import { SidebarNavLink } from "./SidebarNavLink";
import { AccountBadge } from "./AccountBadge";

export function Sidebar() {
  return (
    <div className="flex h-full max-h-screen flex-col gap-2">
      <div className="flex h-14 items-center border-b px-4">
        <TransitionNavLink to="/" className="flex items-center gap-2">
          <img src={logo} className="w-6" />
          <div className="relative">
            <span className="font-medium text-sm">Superstreamer</span>
            <span className="absolute top-0 text-[10px] ml-[2px]">
              {__VERSION__}
            </span>
          </div>
        </TransitionNavLink>
      </div>
      <div className="flex-1 flex-col flex">
        <SidebarTitle className="my-4">Manage</SidebarTitle>
        <nav className="grid items-start px-4 text-sm font-medium">
          <SidebarNavLink to="/assets">
            <Layers className="h-4 w-4" />
            Assets
          </SidebarNavLink>
          <SidebarNavLink to="/jobs">
            <Workflow className="h-4 w-4" />
            Jobs
          </SidebarNavLink>
          <SidebarNavLink to="/storage">
            <Box className="h-4 w-4" />
            Storage
          </SidebarNavLink>
        </nav>
        <SidebarTitle className="my-4">Tools</SidebarTitle>
        <nav className="grid items-start px-4 text-sm font-medium">
          <SidebarNavLink to="/player">
            <Play className="h-4 w-4" />
            Player
          </SidebarNavLink>
          <SidebarNavLink to="/api">
            <Sailboat className="h-4 w-4" />
            API
          </SidebarNavLink>
        </nav>
        <SidebarTitle className="my-4">Other</SidebarTitle>
        <nav className="grid items-start px-4 text-sm font-medium">
          <SidebarNavLink to="/settings">
            <Settings2 className="h-4 w-4" />
            Settings
          </SidebarNavLink>
        </nav>
        <div className="grow" />
        <div className="p-4">
          <AccountBadge />
        </div>
      </div>
    </div>
  );
}
