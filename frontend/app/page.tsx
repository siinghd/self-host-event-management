import { ModeToggle } from "@/components/theme-togglerndefinedndefined";
import { NavigationMenuDemo } from "../components/navbar";
import Overlay from "../components/overlay";
export default function Home() {
  return (
    <>
      <Overlay />
      <div className="relative h-screen w-screen">
        <NavigationMenuDemo />
        <div className="absolute right-4 bottom-4 00 w-fit">
          <ModeToggle />
        </div>

      </div>
    </>

  )
}
