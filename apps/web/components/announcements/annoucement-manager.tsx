"use client";

import { useState } from "react";
import { Megaphone, SearchCheckIcon } from "lucide-react";

interface Course {
    id: string;
    title: string;
}

interface AnnouncementsManagerProps {
    courses: Course[];
}

export const AnnouncementsManager = ({ courses }: AnnouncementsManagerProps) => {

};