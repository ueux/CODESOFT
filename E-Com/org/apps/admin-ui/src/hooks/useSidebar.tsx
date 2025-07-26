import { useAtom } from "jotai"
import { atom } from "jotai";

const activeSideBarItem = atom<string>("/dashboard");

const useSidebar = () => {
    const [activeSidebar, setActiveSidebar] = useAtom(activeSideBarItem)
    return { activeSidebar, setActiveSidebar }
}

export default useSidebar
