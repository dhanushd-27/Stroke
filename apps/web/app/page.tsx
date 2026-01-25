"use client";

import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "@repo/ui/container";
import StrokeMain from "../components/stroke-main";

export default function Home() {
  return (
    <Container>
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <StrokeMain />
      </div>
      <Footer />
    </Container>
  );
}
