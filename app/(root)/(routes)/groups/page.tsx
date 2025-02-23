"use client";

import { useState, useEffect } from "react";
import { GroupCards } from "@/components/group-cards";
import { ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ChevronLeft } from "lucide-react";

const GroupPage = () => {
  const [groupChats, setGroupChats] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchGroupChats = async () => {
      setLoading(true);
      const response = await fetch(`/api/group-chat`);
      const data = await response.json();
      setGroupChats(data);
      setTotalPages(data.length);
      setLoading(false);
    };
    fetchGroupChats();
  }, [currentPage]);

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Group Chats</h1>
      {loading ? (
        <div className="flex items-center justify-center min-h-[600px]">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
      ) : (
        <GroupCards data={groupChats} />
      )}
     {totalPages > 1 && (
        <div className="flex justify-center gap-4 pt-4">
          {currentPage > 1 && (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 p-2 bg-[#C0C1C3] hover:bg-[#B0B1B3] dark:bg-[#505052] dark:hover:bg-[#606062]"
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
          )}
          <div className="flex items-center gap-4">
            {[...Array(totalPages)].map((_, index) => (
              <Button
                key={index + 1}
                variant={currentPage === index + 1 ? "default" : "outline"}
                className="rounded-full w-10 h-10 p-0"
                onClick={() => setCurrentPage(index + 1)}
              >
                {index + 1}
              </Button>
            ))}
          </div>
          {currentPage < totalPages && (
            <Button
              variant="secondary"
              size="icon"
              className="rounded-full w-10 h-10 p-2 bg-[#C0C1C3] hover:bg-[#B0B1B3] dark:bg-[#505052] dark:hover:bg-[#606062]"
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

export default GroupPage;
