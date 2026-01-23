import React from "react";
import "./styles.css";

type ContainerProps = {
  children: React.ReactNode;
};

export default function Container({ children }: ContainerProps) {
  return <main className="h-screen w-full px-4 py-4 sm:px-8 sm:py-8 md:px-16 md:py-8 flex flex-col">{children}</main>;
}
