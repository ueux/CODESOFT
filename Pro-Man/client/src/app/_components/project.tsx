"use client";

import React, { useState } from "react";
import ProjectHeader from "@/app/projects/ProjectHeader";
import Board from "../projects/BoardView";
import List from "../projects/ListView";
import Timeline from "../projects/TimelineView";
import Table from "../projects/TableView";
import ModalNewTask from "@/app/_components/ModalNewTask";
import { useGetProjectsQuery } from "@/state/api";

const Project = ({id}:{id:string}) => {
  const [activeTab, setActiveTab] = useState("Board");
  const [isModalNewTaskOpen, setIsModalNewTaskOpen] = useState(false);

  const { data: projects, isLoading, error } = useGetProjectsQuery();

  if (isLoading) return <div>Loading project...</div>;
  if (error || !projects) return <div>Error loading project</div>;

  const project = projects.find((p) => p.id.toString() === id);
  if (!project) return <div>Project not found</div>;

  return (
    <div>
      <ModalNewTask
        isOpen={isModalNewTaskOpen}
        onClose={() => setIsModalNewTaskOpen(false)}
        id={id}
      />
      <ProjectHeader
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        project={project}
      />
      {activeTab === "Board" && (
        <Board id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "List" && (
        <List id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Timeline" && (
        <Timeline id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
      {activeTab === "Table" && (
        <Table id={id} setIsModalNewTaskOpen={setIsModalNewTaskOpen} />
      )}
    </div>
  );
};

export default Project;
