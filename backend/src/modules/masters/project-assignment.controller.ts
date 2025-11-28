import { Controller, Get, Post, Put, Delete, Body, Param } from '@nestjs/common';

@Controller('project-assignments')
export class ProjectAssignmentController {
  private assignments: any[] = [];
  private idCounter = 1;

  @Get()
  findAll() {
    return this.assignments;
  }

  @Post()
  create(@Body() createDto: any) {
    const newAssignment = {
      id: this.idCounter++,
      ...createDto,
      createdAt: new Date()
    };
    this.assignments.push(newAssignment);
    return newAssignment;
  }

  @Put(':id')
  update(@Param('id') id: string, @Body() updateDto: any) {
    const index = this.assignments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      this.assignments[index] = { 
        ...this.assignments[index], 
        ...updateDto,
        id: this.assignments[index].id,
        createdAt: this.assignments[index].createdAt,
        updatedAt: new Date()
      };
      return this.assignments[index];
    }
    return null;
  }

  @Delete(':id')
  delete(@Param('id') id: string) {
    const index = this.assignments.findIndex(a => a.id === parseInt(id));
    if (index !== -1) {
      this.assignments.splice(index, 1);
      return { message: 'Assignment deleted successfully' };
    }
    return null;
  }
}