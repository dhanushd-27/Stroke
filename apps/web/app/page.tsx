"use client";

import { Button } from "@repo/ui/button";

import React from "react";
import { ThemeToggler } from "../components/theme-toggler";

export default function Home() {
  return (
    <div className="">
      <Button>Button</Button>
      <ThemeToggler />
    </div>
  );
}
