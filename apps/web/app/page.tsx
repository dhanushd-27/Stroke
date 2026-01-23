"use client";

import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "@repo/ui/container";
import CircleCanvas from "../components/canvas/circle-canvas";

export default function Home() {
  return (
    <Container>
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <CircleCanvas />
      </div>
      <Footer />
    </Container>
  );
}
