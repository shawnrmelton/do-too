
      });

      res.json(task);
    } catch (error) {
      console.error('Complete task error:', error);
      res.status(500).json({ error: 'Failed to complete task' });
    }
  },

  // Delete a task
  async deleteTask(req, res) {
    try {
      const { id } = req.params;
      
      const deletedRows = await Task.destroy({
        where: { id }
      });

      if (deletedRows === 0) {
        return res.status(404).json({ error: 'Task not found' });
      }

      res.status(204).send();
    } catch (error) {
      console.error('Delete task error:', error);
      res.status(500).json({ error: 'Failed to delete task' });
    }
  }
};

module.exports = taskController;
