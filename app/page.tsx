import { Button } from "@/components/ui/button";

export default function Top() {
  return (
    <>
      <div className="flex justify-center ">
        <img src="/hero.png" />
      </div>
      <div className="flex justify-center pt-4">
        <Button variant={"custom"}>Register an NFT</Button>
        <div className="px-4" />
        <Button variant={"custom"}>Search registered NFT</Button>
      </div>
    </>
  );
}
