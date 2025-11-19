-- Create books table
CREATE TABLE public.books (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  author TEXT NOT NULL,
  isbn TEXT,
  category TEXT NOT NULL,
  total_copies INTEGER NOT NULL DEFAULT 1,
  available_copies INTEGER NOT NULL DEFAULT 1,
  cover_url TEXT,
  description TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  added_by UUID NOT NULL
);

-- Create book_issues table
CREATE TABLE public.book_issues (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id UUID NOT NULL REFERENCES public.books(id) ON DELETE CASCADE,
  student_id UUID NOT NULL,
  student_name TEXT NOT NULL,
  student_email TEXT NOT NULL,
  issued_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  due_date DATE NOT NULL,
  returned_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'issued' CHECK (status IN ('issued', 'returned', 'overdue')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.books ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.book_issues ENABLE ROW LEVEL SECURITY;

-- RLS Policies for books
CREATE POLICY "Everyone can view books"
  ON public.books FOR SELECT
  USING (true);

CREATE POLICY "Owners can manage books"
  ON public.books FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'owner'
    )
  );

-- RLS Policies for book_issues
CREATE POLICY "Owners can view all book issues"
  ON public.book_issues FOR SELECT
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'owner'
    )
  );

CREATE POLICY "Students can view their own book issues"
  ON public.book_issues FOR SELECT
  USING (auth.uid() = student_id);

CREATE POLICY "Owners can manage book issues"
  ON public.book_issues FOR ALL
  USING (
    auth.uid() IN (
      SELECT id FROM profiles WHERE role = 'owner'
    )
  );

-- Create trigger to update available_copies when book is issued/returned
CREATE OR REPLACE FUNCTION update_book_availability()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' AND NEW.status = 'issued' THEN
    UPDATE books SET available_copies = available_copies - 1 WHERE id = NEW.book_id;
  ELSIF TG_OP = 'UPDATE' AND OLD.status = 'issued' AND NEW.status = 'returned' THEN
    UPDATE books SET available_copies = available_copies + 1 WHERE id = NEW.book_id;
  ELSIF TG_OP = 'DELETE' AND OLD.status = 'issued' THEN
    UPDATE books SET available_copies = available_copies + 1 WHERE id = OLD.book_id;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER book_availability_trigger
  AFTER INSERT OR UPDATE OR DELETE ON book_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_book_availability();

-- Create function to auto-update overdue status
CREATE OR REPLACE FUNCTION check_overdue_books()
RETURNS void AS $$
BEGIN
  UPDATE book_issues
  SET status = 'overdue'
  WHERE status = 'issued' 
    AND due_date < CURRENT_DATE
    AND returned_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Create updated_at trigger function if not exists
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add triggers for updated_at
CREATE TRIGGER update_books_updated_at
  BEFORE UPDATE ON books
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_book_issues_updated_at
  BEFORE UPDATE ON book_issues
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();