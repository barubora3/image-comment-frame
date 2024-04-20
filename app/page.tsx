import { Button } from "@/components/ui/button";

export default function Top() {
  return (
    <>
      <div className="flex justify-center ">
        <img src="/hero.png" />
      </div>
      <div className="flex flex-col justify-center pt-8 text-center">
        <a
          href="/register"
          className="hover:text-indigo-200 transition duration-300"
        >
          <Button variant={"custom"} className="w-60">
            Register an NFT
          </Button>
        </a>

        <div className="py-2 md:px-4" />
        <a
          href="/list"
          className="hover:text-indigo-200 transition duration-300"
        >
          <Button variant={"custom"} className="w-60">
            Search registered NFT
          </Button>
        </a>
      </div>
    </>
  );
}
