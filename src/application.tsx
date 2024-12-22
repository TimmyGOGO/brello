import { useUnit } from "effector-react";

import "@mantine/core/styles/ActionIcon.css";

import styles from "./application.module.css";
import { Button } from "./button";
import { Header } from "./header";
import { KanbanBoard } from "./kanban";
import { $counter, incrementClicked } from "./model";

const Counter = () => {
  const [counter, handleIncrement] = useUnit([$counter, incrementClicked]);

  return <Button onClick={handleIncrement}>{counter}</Button>;
};

export const Application = () => {
  return (
    <>
      <Header />
      <Counter />
      <main className={styles.main}>
        <KanbanBoard />
      </main>
    </>
  );
};
