"use client";

import { Button } from "@repo/ui/button";
import { IconButton } from "@repo/ui/icon-button";
import { Plus, Settings, Trash } from "lucide-react";
import React from "react";

export default function Home() {
  return (
    <div className="ui:p-8 ui:flex ui:flex-col ui:gap-4">
      <div className="ui:flex ui:gap-4 ui:items-center">
        <Button variant="contained">Default Button</Button>
        <IconButton variant="contained" icon={Plus} />
        <IconButton variant="contained" icon={Settings}  />
      </div>

      <div className="ui:flex ui:gap-4 ui:items-center">
        <Button variant="outline">Outline Button</Button>
        <IconButton variant="outline" icon={Plus} />
        <IconButton variant="outline" icon={Settings} />
      </div>

      <div className="ui:flex ui:gap-4 ui:items-center">
        <Button variant="text">Text Button</Button>
        <IconButton variant="text" icon={Plus} />
        <IconButton variant="text" icon={Trash} />
      </div>
    </div>
  );
}
