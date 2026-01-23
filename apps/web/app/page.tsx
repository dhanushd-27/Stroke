"use client";

import React from "react";
import Header from "../components/header";
import Footer from "../components/footer";
import Container from "@repo/ui/container";

export default function Home() {
  return (
    <Container>
      <Header />
      <div className="flex-1 flex items-center justify-center">
        <h1>Home</h1>
      </div>
      <Footer />
    </Container>
  );
}
