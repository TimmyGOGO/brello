import { useState } from "react";

import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { ActionIcon, Group } from "@mantine/core";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import cn from "clsx";
import { nanoid } from "nanoid";

import { Button } from "../button";
import { customScrollStyles } from "../custom-scroll-styles";
import { Textarea } from "../textarea";
import styles from "./kanban.module.css";

type KanbanList = {
  id: string;
  title: string;
  cards: KanbanCard[];
};

type KanbanCard = {
  id: string;
  title: string;
};

type KanbanBoard = KanbanList[];

const TASK_NAMES = [
  "Set up development environment",
  "Create component structure",
  "Implement basic routing",
  "Design task board layout",
  "Add drag-and-drop functionality for cards",
  "Develop notification system",
  "Integrate user authentication",
  "Connect Google API for OAuth",
  "Implement task filtering by status",
  "Add tagging functionality",
  "Develop task prioritization system",
  "Integrate third-party analytics API",
  "Set up automatic data saving",
  "Create user roles system",
  "Add comments to tasks",
  "Integrate external file storage",
  "Enable public boards functionality",
  "Develop mobile interface version",
  "Add push notifications",
  "Optimize application performance",
  "Implement board archiving functionality",
  "Develop import/export data feature",
  "Create dark mode for interface",
  "Add card copying functionality",
  "Integrate Jira data migration",
  "Create task charts and graphs",
  "Implement search functionality for tasks",
  "Develop quick task evaluation widget",
  "Add deadlines feature for cards",
  "Set up automatic data backups",
  "Add multi-language support",
  "Create board customization system",
  "Integrate with Slack for task updates",
  "Add task change history tracking",
  "Create “My Tasks” page for users",
  "Develop API for external system integration",
  "Create statistics for completed tasks",
  "Implement bulk card movement system",
  "Add task subscription functionality",
  "Connect Google Analytics for tracking",
  "Develop user documentation",
  "Integrate calendar sync for deadlines",
  "Add task recovery from trash functionality",
  "Develop “Reports and Analysis” section",
  "Create admin panel for user management",
  "Implement multi-level subtask system",
  "Integrate GitHub sync for task tracking",
  "Optimize database for large datasets",
  "Create metrics system to track productivity",
  "Add task grouping by category functionality",
];

function randomTaskName() {
  return TASK_NAMES[Math.floor(Math.random() * TASK_NAMES.length)];
}

function createRandomTaskList(amount: number): KanbanCard[] {
  return Array.from({ length: amount }, () => ({ id: nanoid(), title: randomTaskName() }));
}

const INITIAL_BOARD: KanbanList[] = [
  {
    id: nanoid(),
    title: "To Do",
    cards: createRandomTaskList(15),
  },
  {
    id: nanoid(),
    title: "In Progress",
    cards: createRandomTaskList(4),
  },
  {
    id: nanoid(),
    title: "Done",
    cards: createRandomTaskList(30),
  },
];

function cardMove(
  board: KanbanBoard,
  sourceColumnId: string,
  destinationColumnId: string,
  fromIndex: number,
  toIndex: number,
): KanbanBoard {
  const sourceColumnIndex = board.findIndex((column) => column.id === sourceColumnId);
  const destinationColumnIndex = board.findIndex((column) => column.id === destinationColumnId);

  const sourceColumn = board[sourceColumnIndex];
  const destinationColumn = board[destinationColumnIndex];

  const card = sourceColumn.cards[fromIndex];

  const updatedSourceColumn = { ...sourceColumn, cards: sourceColumn.cards.filter((_, index) => index !== fromIndex) };
  const updatedDestinationColumn = {
    ...destinationColumn,
    cards: [...destinationColumn.cards.slice(0, toIndex), { ...card }, ...destinationColumn.cards.slice(toIndex)],
  };

  return board.map((column) => {
    if (column.id === sourceColumnId) {
      return updatedSourceColumn;
    }

    if (column.id === destinationColumnId) {
      return updatedDestinationColumn;
    }

    return column;
  });
}

function listReorder(list: KanbanList, startIndex: number, endIndex: number): KanbanList {
  const cards = Array.from(list.cards);
  const [removed] = cards.splice(startIndex, 1);
  cards.splice(endIndex, 0, removed);

  return { ...list, cards };
}

export function KanbanBoard() {
  const [board, setBoard] = useState(INITIAL_BOARD);

  const onDragEnd: OnDragEndResponder = ({ source, destination }) => {
    if (!destination) {
      // Dropped outside of a column
      return;
    }

    const sourceId = source.droppableId;
    const destinationId = destination.droppableId;

    const insideTheSameColumn = sourceId === destinationId;
    if (insideTheSameColumn) {
      const column = board.find((column) => column.id === sourceId);
      if (column) {
        const reorderedList = listReorder(column, source.index, destination.index);
        const updatedBoard = board.map((item) => (item.id === sourceId ? reorderedList : item));
        setBoard(updatedBoard);
      }
    } else {
      const updatedBoard = cardMove(board, sourceId, destinationId, source.index, destination.index);
      setBoard(updatedBoard);
    }
  };

  function onCreateCard(card: KanbanCard, columnId: string) {
    const updatedBoard = board.map((column) => {
      if (column.id === columnId) {
        return { ...column, cards: [...column.cards, card] };
      }

      return column;
    });

    setBoard(updatedBoard);
  }

  function onColumnUpdate(updatedList: KanbanList) {
    const updatedBoard = board.map((column) => (column.id === updatedList.id ? updatedList : column));
    setBoard(updatedBoard);
  }

  return (
    <section className={cn(styles.section)}>
      <header className={styles.headerSection}>
        <h1 className={styles.title}>Sprint #1</h1>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cn(styles.board, customScrollStyles)}>
          {board.map((column) => (
            <KanbanColumn
              key={column.id}
              id={column.id}
              title={column.title}
              cards={column.cards}
              onUpdate={onColumnUpdate}
            >
              <KanbanCreateCard onCreate={(card) => onCreateCard(card, column.id)} />
            </KanbanColumn>
          ))}
        </div>
      </DragDropContext>
    </section>
  );
}

function KanbanColumn({
  id,
  title,
  cards,
  children,
  onUpdate,
}: {
  id: string;
  title: string;
  cards: KanbanCard[];
  children?: React.ReactNode;
  onUpdate: (updatedList: KanbanList) => void;
}) {
  function onCardEdit(updatedCard: KanbanCard) {
    const updatedCards = cards.map((card) => (card.id === updatedCard.id ? updatedCard : card));
    onUpdate({ id, title, cards: updatedCards });
  }

  function onCardDelete(cardId: string) {
    const updatedCards = cards.filter((card) => card.id !== cardId);
    onUpdate({ id, title, cards: updatedCards });
  }

  return (
    <Droppable key={id} droppableId={id}>
      {(provided) => (
        <div ref={provided.innerRef} className={styles.column} {...provided.droppableProps}>
          <p className={styles.columnTitle}>{title}</p>
          <div className={styles.list}>
            {cards.map(({ id, title }, index) => (
              <KanbanCard
                key={id}
                id={id}
                index={index}
                title={title}
                onEdit={onCardEdit}
                onDelete={() => onCardDelete(id)}
              />
            ))}
            {provided.placeholder}
            {children}
          </div>
        </div>
      )}
    </Droppable>
  );
}

function KanbanCard({
  id,
  index,
  title,
  onEdit,
  onDelete,
}: {
  id: string;
  index: number;
  title: string;
  onEdit: (card: KanbanCard) => void;
  onDelete: () => void;
}) {
  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  function onReset() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onEdit({ id, title: editTitle });
    onReset();
  }

  if (editMode) {
    return (
      <div className={styles.item}>
        <Textarea variant="md" value={editTitle} onValue={setEditTitle} />
        <Group>
          <ActionIcon onClick={onEditFinished}>
            <IconCheck size={14} />
          </ActionIcon>
          <ActionIcon onClick={onReset}>
            <IconX size={14} />
          </ActionIcon>
        </Group>
      </div>
    );
  }

  return (
    <Draggable key={id} draggableId={id} index={index}>
      {(provided, snapshot) => (
        <div
          ref={provided.innerRef}
          {...provided.draggableProps}
          {...provided.dragHandleProps}
          className={cn(styles.item, snapshot.isDragging ? styles.dragging : null)}
        >
          <p className={styles.itemText}>{title}</p>
          <Group>
            <ActionIcon onClick={() => setEditMode(true)}>
              <IconPencil size={14} />
            </ActionIcon>
            <ActionIcon onClick={() => onDelete()}>
              <IconTrash size={14} />
            </ActionIcon>
          </Group>
        </div>
      )}
    </Draggable>
  );
}

function KanbanCreateCard({ onCreate }: { onCreate: (card: KanbanCard) => void }) {
  const [title, setTitle] = useState("");

  function onReset() {
    setTitle("");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    onCreate({ id: nanoid(), title });
    onReset();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <Textarea variant="md" value={title} onValue={setTitle} placeholder="Start making new card here" />
      <Button type="submit">Add card</Button>
    </form>
  );
}
