import { Button } from "@/components/ui/button";

export default function Top() {
  return (
    <>
      <div className="flex justify-center ">
        <img src="/hero.png" />
      </div>
      <div className="flex justify-center pt-4">
        <a
          href="/register"
          className="hover:text-indigo-200 transition duration-300"
        >
          <Button variant={"custom"}>Register an NFT</Button>
        </a>

        <div className="px-4" />
        <a
          href="/list"
          className="hover:text-indigo-200 transition duration-300"
        >
          <Button variant={"custom"}>Search registered NFT</Button>
        </a>
      </div>
    </>
  );
}
