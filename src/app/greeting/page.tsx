"use client";

import { trpc } from "@/utils/trpc";
import { useState } from "react";

export default function GreetingPage() {
  const [name, setName] = useState("");

  const { data, isLoading, error } = trpc.greeting.hello.useQuery(
    { name },
    {
      enabled: name.length > 0,
    }
  );

  return (
    <div style={{ padding: "20px" }}>
      <h1>Greeting Example</h1>
      <p>
        Enter your name below to get a greeting from the server.
      </p>
      <input
        type="text"
        value={name}
        onChange={(e) => setName(e.target.value)}
        placeholder="Enter your name"
        style={{ padding: "8px", marginRight: "10px" }}
      />

      {isLoading && <p>Loading...</p>}
      {error && <p>Error: {error.message}</p>}
      {data && <h2>{data.text}</h2>}
    </div>
  );
}