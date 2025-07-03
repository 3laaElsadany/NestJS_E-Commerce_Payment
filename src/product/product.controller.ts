import { Controller, Get, Post, Body, Patch, Param, Delete, UseGuards } from '@nestjs/common';
import { ProductService } from './product.service';
import { CreateProductDto } from './dto/create-product.dto';
import { UpdateProductDto } from './dto/update-product.dto';
import { Roles } from 'src/utils/decorator/Roles.decorator';
import { UsersGuard } from 'src/utils/guards/users.guard';
import { Product } from 'src/utils/schema/product.schema';

@UseGuards(UsersGuard)
@Controller('product')
export class ProductController {
  constructor(private readonly productService: ProductService) { }

  @Roles(['admin', 'manager'])
  @Post()
  async createProduct(@Body() createProductDto: CreateProductDto): Promise<Product> {
    return await this.productService.createProduct(createProductDto);
  }

  @Get()
  async getProducts(): Promise<Product[]> {
    return await this.productService.getProducts();
  }

  @Get(':id')
  async getProduct(@Param('id') id: string): Promise<Product> {
    return await this.productService.getProduct(id);
  }

  @Roles(['admin', 'manager'])
  @Patch(':id')
  async updateProduct(@Param('id') id: string, @Body() updateProductDto: UpdateProductDto): Promise<Product> {
    return await this.productService.updateProduct(id, updateProductDto);
  }

  @Roles(['admin'])
  @Delete(':id')
  async deleteProduct(@Param('id') id: string): Promise<void> {
    return await this.productService.deleteProduct(id);
  }
}
