import { Component, OnInit } from '@angular/core';
import { FormArray, FormControl, FormGroup, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Params, Router } from '@angular/router';
import { RecipeService } from '../recipe.service';
import { NgFor } from '@angular/common';

@Component({
  selector: 'app-recipe-edit',
  standalone: true,
  imports: [ReactiveFormsModule, FormsModule, NgFor],
  templateUrl: './recipe-edit.component.html',
  styleUrl: './recipe-edit.component.css'
})
export class RecipeEditComponent implements OnInit {
  id!: number;
  editMode!: boolean;
  recipeForm!: FormGroup;

  constructor(
        private route: ActivatedRoute, 
        private recipeService: RecipeService,
        private router: Router
      ) {
    this.recipeForm = new FormGroup({
      'name': new FormControl('', [Validators.required]),
      'imagePath': new FormControl('', [Validators.required]),
      'description': new FormControl('', [Validators.required]),
      'ingredients': new FormArray([])
    });
  }

  ngOnInit() {
    this.route.params.subscribe(
      (params: Params) => {
        this.id = params['id'];
        this.editMode = params['id'] != null
        this.initForm();
      }
    )
  }

  onSubmit() {
    // const newRecipe = new Recipe(
    //   this.recipeForm.value['name'],
    //   this.recipeForm.value['imagePath'],
    //   this.recipeForm.value['name'],
    //   this.recipeForm.value['ingredients'],
    // );
    if(this.editMode){
      this.recipeService.updateRecipe(this.id, this.recipeForm.value)
    }
    else{
      this.recipeService.addRecipe( this.recipeForm.value);
    }
    this.onCancel();
  }
  onAddIngredient(){
    (this.recipeForm.get('ingredients') as FormArray).push(
      new FormGroup({
        'name': new FormControl(null, [Validators.required]),
        'amount': new FormControl(null, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
      })
    );
  }
  onClearIngredients(){
    (this.recipeForm.get('ingredients') as FormArray).clear();
  }
  onDeleteIngredient(index: number){
    (this.recipeForm.get('ingredients') as FormArray).removeAt(index);
  }
  onCancel(){
    this.router.navigate(['../'], {relativeTo: this.route})
  }
  initForm() {
    let recipeName = '';
    let recipeImgPath = '';
    let recipeDesc = '';
    let recipeIngredients: FormArray = this.recipeForm.get('ingredients') as FormArray;

    if (this.editMode) {
      const recipe = this.recipeService.getRecipe(this.id);
      recipeName = recipe.name;
      recipeImgPath = recipe.imagePath;
      recipeDesc = recipe.description;
      if(recipe['ingredients']){
        for (const ingredient of recipe.ingredients) {
          recipeIngredients.push(
            new FormGroup({
              'name': new FormControl(ingredient.name, [Validators.required]),
              'amount': new FormControl(ingredient.amount, [Validators.required, Validators.pattern(/^[1-9]+[0-9]*$/)])
            })
          );
        }
      }
    }

    this.recipeForm.patchValue({
      'name': recipeName,
      'imagePath': recipeImgPath,
      'description': recipeDesc
    });
  }

  get controls() { // a getter!
    return (this.recipeForm.get('ingredients') as FormArray).controls;
  }

}
