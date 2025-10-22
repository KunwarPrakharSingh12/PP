-- Allow board owners to delete their boards
CREATE POLICY "Board owners can delete their boards"
ON public.boards
FOR DELETE
USING (auth.uid() = owner_id);