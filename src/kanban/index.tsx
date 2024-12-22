import { useState } from "react";

import { DragDropContext, Draggable, Droppable, OnDragEndResponder } from "@hello-pangea/dnd";
import { ActionIcon, Group } from "@mantine/core";
import { IconCheck, IconPencil, IconTrash, IconX } from "@tabler/icons-react";
import cn from "clsx";
import { useUnit } from "effector-react";

import { Button } from "../button";
import { customScrollStyles } from "../custom-scroll-styles";
import { Textarea } from "../textarea";
import styles from "./kanban.module.css";
import {
  $board,
  type KanbanBoard,
  type KanbanCard,
  cardCreateClicked,
  cardDeleteClicked,
  cardEditClicked,
  cardMoved,
} from "./model";

export function KanbanBoard() {
  const [board, onCardMove] = useUnit([$board, cardMoved]);

  const onDragEnd: OnDragEndResponder = ({ source, destination }) => {
    if (!destination) {
      // Dropped outside of a column
      return;
    }

    const fromColumnId = source.droppableId;
    const toColumnId = destination.droppableId;
    const fromIndex = source.index;
    const toIndex = destination.index;

    onCardMove({ fromColumnId, toColumnId, fromIndex, toIndex });
  };

  return (
    <section className={cn(styles.section)}>
      <header className={styles.headerSection}>
        <h1 className={styles.title}>Sprint #1</h1>
      </header>
      <DragDropContext onDragEnd={onDragEnd}>
        <div className={cn(styles.board, customScrollStyles)}>
          {board.map((column) => (
            <KanbanColumn key={column.id} id={column.id} title={column.title} cards={column.cards}>
              <KanbanCreateCard columnId={column.id} />
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
}: {
  id: string;
  title: string;
  cards: KanbanCard[];
  children?: React.ReactNode;
}) {
  return (
    <Droppable key={id} droppableId={id}>
      {(provided) => (
        <div ref={provided.innerRef} className={styles.column} {...provided.droppableProps}>
          <p className={styles.columnTitle}>{title}</p>
          <div className={styles.list}>
            {cards.map((card, index) => (
              <KanbanCard key={card.id} id={card.id} index={index} title={card.title} columnId={id} />
            ))}
            {provided.placeholder}
            {children}
          </div>
        </div>
      )}
    </Droppable>
  );
}

function KanbanCard({ id, index, title, columnId }: { id: string; index: number; title: string; columnId: string }) {
  const [onCardEdit, onCardDelete] = useUnit([cardEditClicked, cardDeleteClicked]);
  const [editTitle, setEditTitle] = useState(title);
  const [editMode, setEditMode] = useState(false);

  function resetEditForm() {
    setEditTitle(title);
    setEditMode(false);
  }

  function onEditFinished() {
    onCardEdit({ columnId, cardId: id, card: { title: editTitle } });
    resetEditForm();
  }

  function onDelete() {
    onCardDelete({ columnId, cardId: id });
  }

  if (editMode) {
    return (
      <div className={styles.item}>
        <Textarea variant="md" value={editTitle} onValue={setEditTitle} />
        <Group>
          <ActionIcon onClick={onEditFinished}>
            <IconCheck size={14} />
          </ActionIcon>
          <ActionIcon onClick={resetEditForm}>
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

function KanbanCreateCard({ columnId }: { columnId: string }) {
  const [onCreateCard] = useUnit([cardCreateClicked]);
  const [title, setTitle] = useState("");

  function onReset() {
    setTitle("");
  }

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    onCreateCard({ columnId, card: { title } });
    onReset();
  }

  return (
    <form className={styles.form} onSubmit={onSubmit}>
      <Textarea variant="md" value={title} onValue={setTitle} placeholder="Start making new card here" />
      <Button type="submit">Add card</Button>
    </form>
  );
}
