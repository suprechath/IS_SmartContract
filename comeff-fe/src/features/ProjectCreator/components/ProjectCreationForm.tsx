import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Dialog, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";

import { Upload, X, FileText, Calendar, DollarSign, TrendingUp, Leaf, MapPin } from "lucide-react";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";


interface CreateProjectModalProps {
  isOpen: boolean;
  setIsOpen: boolean;
}


export const ProjectCreationForm = ({ isOpen, setIsOpen }: CreateProjectModalProps) => {
  console.log("Rendering ProjectCreationForm");

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogHeader className="pb-6 text-center">
        <DialogTitle className="text-2xl text-primary font-bold">Create New Project</DialogTitle>
      </DialogHeader>
    </Dialog>
  );
};