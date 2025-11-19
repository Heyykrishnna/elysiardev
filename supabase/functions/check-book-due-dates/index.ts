import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.50.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('Starting book due date check...');

    const today = new Date();
    const threeDaysFromNow = new Date(today);
    threeDaysFromNow.setDate(today.getDate() + 3);

    // Format dates for comparison
    const todayStr = today.toISOString().split('T')[0];
    const threeDaysStr = threeDaysFromNow.toISOString().split('T')[0];

    // Get all issued books
    const { data: issues, error: issuesError } = await supabase
      .from('book_issues')
      .select('*, books(title, author)')
      .eq('status', 'issued');

    if (issuesError) {
      throw issuesError;
    }

    console.log(`Found ${issues?.length || 0} issued books`);

    let notificationsCreated = 0;

    for (const issue of issues || []) {
      const dueDate = new Date(issue.due_date);
      const dueDateStr = dueDate.toISOString().split('T')[0];

      // Check if book is overdue
      if (dueDateStr < todayStr) {
        // Update status to overdue
        await supabase
          .from('book_issues')
          .update({ status: 'overdue' })
          .eq('id', issue.id);

        // Check if notification already exists
        const { data: existingNotif } = await supabase
          .from('student_notifications')
          .select('id')
          .eq('book_issue_id', issue.id)
          .eq('notification_type', 'overdue')
          .single();

        if (!existingNotif) {
          // Create overdue notification
          await supabase
            .from('student_notifications')
            .insert({
              student_id: issue.student_id,
              title: 'Book Overdue!',
              message: `The book "${issue.books.title}" by ${issue.books.author} is overdue. Please return it as soon as possible.`,
              notification_type: 'overdue',
              book_issue_id: issue.id,
            });
          notificationsCreated++;
          console.log(`Created overdue notification for issue ${issue.id}`);
        }
      } 
      // Check if due date is within 3 days
      else if (dueDateStr <= threeDaysStr && dueDateStr >= todayStr) {
        // Check if notification already exists
        const { data: existingNotif } = await supabase
          .from('student_notifications')
          .select('id')
          .eq('book_issue_id', issue.id)
          .eq('notification_type', 'due_soon')
          .single();

        if (!existingNotif) {
          const daysUntilDue = Math.ceil((dueDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
          // Create due soon notification
          await supabase
            .from('student_notifications')
            .insert({
              student_id: issue.student_id,
              title: 'Book Due Soon',
              message: `The book "${issue.books.title}" by ${issue.books.author} is due in ${daysUntilDue} day${daysUntilDue > 1 ? 's' : ''}. Please plan to return it on time.`,
              notification_type: 'due_soon',
              book_issue_id: issue.id,
            });
          notificationsCreated++;
          console.log(`Created due soon notification for issue ${issue.id}`);
        }
      }
    }

    console.log(`Process complete. Created ${notificationsCreated} notifications.`);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Checked ${issues?.length || 0} issues, created ${notificationsCreated} notifications`,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );
  } catch (error) {
    console.error('Error in check-book-due-dates:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});