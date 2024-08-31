"use client";

import { RecoilRoot } from "recoil";
import Home from "./Home";

const Page = () => {
  return (
    <RecoilRoot>
      <Home />
    </RecoilRoot>
  );
};

export default Page;
