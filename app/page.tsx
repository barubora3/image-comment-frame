import { Button } from "@/components/ui/button";

export default function Top() {
  return (
    <>
      <div className="flex justify-center ">
        <img src="/hero.png" />
      </div>
      <div className="flex flex-col justify-center pt-8 text-center">
        <span>
          <a href="/register" className="">
            <Button
              variant={"custom"}
              className="w-60 hover:text-indigo-200 transition duration-300"
            >
              Register an NFT
            </Button>
          </a>
        </span>
        <div className="py-2 md:px-4" />
        <span>
          <a
            href="/list"
            className="hover:text-indigo-200 transition duration-300"
          >
            <Button variant={"custom"} className="w-60">
              Search registered NFT
            </Button>
          </a>
        </span>
        <div className="py-4 md:px-4" />
      </div>
    </>
  );
}
